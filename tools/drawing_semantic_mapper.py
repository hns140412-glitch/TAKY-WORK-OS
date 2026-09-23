#!/usr/bin/env python3
"""TAKY Drawing Engine - rule-bound semantic candidate mapper.

Maps extracted CAD entities only through explicitly VERIFIED rules.
Unmatched entities remain UNKNOWN. Enabled-but-unverified rules are ignored.
This tool never infers architecture from geometry alone.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict, List


TRUSTED_RULE_STATES = {
    "CAD_RULE_VERIFIED",
    "USER_CONFIRMED",
    "SOURCE_EXPLICIT",
    "VERIFIED_SEMANTIC",
}


def _matches(value: str, rule: Dict[str, Any]) -> bool:
    mode = str(rule.get("match", "regex")).lower()
    pattern = str(rule.get("pattern", ""))
    if mode == "exact":
        return value == pattern
    if mode == "prefix":
        return value.startswith(pattern)
    return re.search(pattern, value, flags=re.IGNORECASE) is not None


def map_entities(payload: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
    if "entities" not in payload:
        raise ValueError("FULL_ENTITY_PAYLOAD_REQUIRED")

    all_enabled = [r for r in rules.get("rules", []) if r.get("enabled", True)]
    active_rules = [
        r for r in all_enabled
        if str(r.get("verification_state", "")).upper() in TRUSTED_RULE_STATES
    ]
    ignored_unverified = [
        {
            "rule_id": r.get("rule_id"),
            "pattern": r.get("pattern"),
            "verification_state": r.get("verification_state", "UNVERIFIED"),
        }
        for r in all_enabled
        if r not in active_rules
    ]

    out: List[Dict[str, Any]] = []

    for entity in payload.get("entities", []):
        layer = str(entity.get("layer", ""))
        kind = str(entity.get("type", ""))
        matched = []
        for rule in active_rules:
            field = str(rule.get("field", "layer"))
            if field == "layer":
                value = layer
            elif field == "entity_type":
                value = kind
            elif field == "block_name":
                value = str((entity.get("geometry") or {}).get("name", ""))
            else:
                continue
            if _matches(value, rule):
                matched.append(rule)

        if len(matched) == 1:
            rule = matched[0]
            semantic = str(rule["semantic_type"])
            confidence = str(rule.get("confidence", "RULE_MATCH"))
            rule_id = str(rule.get("rule_id", ""))
            verification_state = str(rule.get("verification_state", "")).upper()
            state = "CANDIDATE"
        elif len(matched) > 1:
            semantic = "UNKNOWN"
            confidence = "CONFLICT"
            rule_id = None
            verification_state = "CONFLICT"
            state = "REVIEW_REQUIRED"
        else:
            semantic = "UNKNOWN"
            confidence = "UNRESOLVED"
            rule_id = None
            verification_state = "UNRESOLVED"
            state = "UNMAPPED"

        out.append(
            {
                "handle": entity.get("handle"),
                "layer": layer,
                "entity_type": kind,
                "semantic_type": semantic,
                "semantic_state": state,
                "verification_state": verification_state,
                "confidence": confidence,
                "rule_id": rule_id,
                "geometry": entity.get("geometry"),
                "annotation": entity.get("annotation"),
                "presentation": entity.get("presentation"),
            }
        )

    return {
        "schema": "TAKY_DXF_SEMANTIC_CANDIDATES_V2",
        "rule_set_id": rules.get("rule_set_id"),
        "rule_set_version": rules.get("rule_set_version"),
        "rule_set_digest": rules.get("rule_set_digest"),
        "canonical_promotion": False,
        "trusted_rule_states": sorted(TRUSTED_RULE_STATES),
        "ignored_unverified_rules": ignored_unverified,
        "records": out,
        "stats": {
            "total": len(out),
            "candidate": sum(x["semantic_state"] == "CANDIDATE" for x in out),
            "verified_candidate": sum(
                x["semantic_state"] == "CANDIDATE"
                and x["verification_state"] in TRUSTED_RULE_STATES
                for x in out
            ),
            "unmapped": sum(x["semantic_state"] == "UNMAPPED" for x in out),
            "review_required": sum(x["semantic_state"] == "REVIEW_REQUIRED" for x in out),
            "ignored_unverified_rule_count": len(ignored_unverified),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("entity_json")
    parser.add_argument("rule_json")
    parser.add_argument("--out")
    args = parser.parse_args()

    payload = json.loads(Path(args.entity_json).read_text(encoding="utf-8"))
    rules = json.loads(Path(args.rule_json).read_text(encoding="utf-8"))
    result = map_entities(payload, rules)
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    else:
        print(text)


if __name__ == "__main__":
    main()

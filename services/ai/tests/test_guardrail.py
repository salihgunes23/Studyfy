"""Guardrail kapısı için birim testleri — zero-hallucination davranışı."""

from app.pipelines.guardrail import GuardrailDecision, retrieval_guardrail


def test_empty_retrieval_refuses() -> None:
    assert retrieval_guardrail([]) is GuardrailDecision.REFUSE


def test_weak_retrieval_refuses() -> None:
    assert retrieval_guardrail([0.05, 0.1, 0.15]) is GuardrailDecision.REFUSE


def test_strong_retrieval_proceeds() -> None:
    assert retrieval_guardrail([0.05, 0.42, 0.3]) is GuardrailDecision.PROCEED


def test_threshold_boundary() -> None:
    assert retrieval_guardrail([0.2], min_score=0.2) is GuardrailDecision.PROCEED
    assert retrieval_guardrail([0.19], min_score=0.2) is GuardrailDecision.REFUSE

from app.main import health


def test_health_contract_is_reserved() -> None:
    assert health() == {"status": "ok", "service": "tryon-orchestrator"}

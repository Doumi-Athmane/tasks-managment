import pytest

@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """
    Optional: remove this if you want to explicitly request db with `db` fixture.
    """
    pass

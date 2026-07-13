# Releasing `webforge-theatom`

A repeatable checklist for cutting a new release of the Python package. Every
step runs from the `python/` directory unless noted.

> **Names to remember**
> - PyPI distribution name: **`webforge-theatom`**
> - Import name: **`webforge`**
> - Git tags for this package are prefixed **`py-v`** (e.g. `py-v0.1.0`) so they
>   don't collide with the browser-extension's tags.

---

## 0. One-time setup

- Accounts: [PyPI](https://pypi.org/account/register/) **and**
  [TestPyPI](https://test.pypi.org/account/register/) (separate sites).
- API tokens: create one on each, under *Account settings → API tokens*.
- Store them so you're not pasting by hand. Create `~/.pypirc` (chmod 600):

  ```ini
  [distutils]
  index-servers =
      pypi
      testpypi

  [pypi]
  username = __token__
  password = pypi-XXXXXXXX          # your real-PyPI token

  [testpypi]
  repository = https://test.pypi.org/legacy/
  username = __token__
  password = pypi-YYYYYYYY          # your TestPyPI token
  ```

  With this file, `twine upload` no longer prompts. **Never commit `~/.pypirc`
  or any token.**

- Tooling (into your active venv):

  ```bash
  python -m pip install --upgrade build twine
  ```

---

## 1. Prepare the release

1. **Decide the version** using [SemVer](https://semver.org): patch (bug fix),
   minor (new backwards-compatible feature), major (breaking change).
2. **Bump the version** in one place — `src/webforge/_version.py`:
   ```python
   __version__ = "0.2.0"
   ```
   (`pyproject.toml` reads this dynamically, so nothing else to edit.)
3. **Update `CHANGELOG.md`**: move items from `[Unreleased]` into a new
   `## [0.2.0] - YYYY-MM-DD` section and refresh the compare/tag links at the
   bottom.
4. **Update `README.md`** if the public API or usage changed.

---

## 2. Test

```bash
python -m pytest -m "not integration"     # fast unit tests
playwright install chromium               # once per environment
python -m pytest -m integration           # real-browser end-to-end
```

Both suites must be green before continuing.

---

## 3. Build clean artifacts

```bash
rm -rf dist build
python -m build            # produces dist/*.whl and dist/*.tar.gz
python -m twine check dist/*   # metadata + README render must PASS
```

Sanity-check the wheel bundles the JS resource:

```bash
python -c "import zipfile,glob; z=zipfile.ZipFile(sorted(glob.glob('dist/*.whl'))[-1]); print('\n'.join(n for n in z.namelist() if n.endswith('.js')))"
# expect: webforge/_resources/extract_tokens.js
```

---

## 4. Dry run on TestPyPI

```bash
twine upload --repository testpypi dist/*
```

Then verify a clean install in a throwaway environment (the
`--extra-index-url` lets Playwright resolve from real PyPI):

```bash
python -m venv /tmp/wf-verify && source /tmp/wf-verify/bin/activate
pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple/ webforge-theatom
python -c "import webforge; print('OK', webforge.__version__)"
deactivate
```

The printed version must match the one you're releasing.

> The **"trusted publishing not supported"** warning from twine is expected when
> uploading from a laptop instead of CI — it just means token auth is used.

---

## 5. Publish to real PyPI  ⚠️ irreversible

A published version number can **never** be reused. Only proceed once TestPyPI
looked correct.

```bash
twine upload dist/*
```

Verify:

```bash
pip install --upgrade webforge-theatom
python -c "import webforge; print(webforge.__version__)"
```

Live page: <https://pypi.org/project/webforge-theatom/>

---

## 6. Tag and push

```bash
git tag py-v0.2.0
git push origin py-v0.2.0
```

Then open a new `## [Unreleased]` section in `CHANGELOG.md` for the next cycle.

---

## Quick reference (an already-prepared release)

```bash
cd python
rm -rf dist build
python -m build
python -m twine check dist/*
twine upload --repository testpypi dist/*   # dry run
twine upload dist/*                          # real PyPI (irreversible)
git tag py-v$(python -c "import webforge; print(webforge.__version__)")
git push --tags
```

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `File already exists` on upload | That version was already published; bump the version — you can't overwrite. |
| `twine check` fails on README | Fix Markdown; PyPI renders a restricted subset. Re-run `python -m build` after edits. |
| `403 Forbidden` | Wrong token or wrong index (TestPyPI token can't upload to PyPI, and vice-versa). |
| Wheel missing `extract_tokens.js` | Confirm the `[tool.hatch.build.targets.wheel.force-include]` block in `pyproject.toml`. |

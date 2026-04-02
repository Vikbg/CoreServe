# Contributing to CoreServe

Thanks for contributing to CoreServe.

## Workflow

1. Fork the repository.
2. Clone your fork:

```bash
git clone https://github.com/your-username/CoreServe.git
cd CoreServe
```

3. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

4. Make focused changes.
5. Run the checks:

```bash
pnpm test
pnpm lint
```

6. Commit your work with a clear message.
7. Push your branch and open a pull request.

## Guidelines

- Keep the architecture consistent with the existing structure.
- Prefer small, reusable functions over large handlers.
- Update documentation when API behavior changes.
- Add or adjust tests when fixing bugs or changing logic.
- Keep commit messages explicit and descriptive.

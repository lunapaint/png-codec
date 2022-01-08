## Dependencies

```sh
# Install node dependencies based on package-lock.json
npm ci

# Pull submodules required for tests
git submodule update --init --recursive
```

## Testing

```sh
npm run watch
```

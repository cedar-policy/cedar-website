// Used in place of the generated bindings when they haven't been built, so the
// rest of the site builds without Rust. See scripts/build-tpe-explorer.sh.
export class Explorer {
    constructor() {
        throw new Error('The TPE explorer was not built. Run `npm run build:tpe` (needs Rust) and restart.');
    }
}

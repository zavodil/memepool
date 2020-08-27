const shell = require('shelljs')

shell.fatal = true // same as "set -e"

// Note: see flags in ./cargo/config
shell.exec('cargo build --target wasm32-unknown-unknown --release')

shell.cp('./target/wasm32-unknown-unknown/release/memeguild.wasm', './res');

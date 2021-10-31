# rollup won't work on windows when the drive letter of the current shell is lower-case

# worky: `C:\...\folder> npm run build` 

# NO worky: `c:\...\folder> npm run build` 

# Just use `ps` instead of `cmd`!

[via rollup/plugins/issues/287#784897332](https://github.com/rollup/plugins/issues/287#issuecomment-784897332)
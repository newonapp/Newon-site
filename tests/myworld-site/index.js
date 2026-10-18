// Entry so that `node --test tests/myworld-site/` (directory argument) runs the MY WORLD suite.
// Node resolves a directory argument to its index.js; the real tests live in *.test.mjs.
import("./myworld-site.test.mjs");

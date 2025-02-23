const express = require("express");
const { runCodeWithJudge0 } = require("../controllers/codeExecutionController");

const router = express.Router();

router.post("/run-judge0", runCodeWithJudge0);

module.exports = router;

#!/bin/bash
cd /tmp/claude-0/-home-claude/6c729d68-f9d7-571d-9221-b0a50736d560/scratchpad/testcopy
OUT=/tmp/claude-0/-home-claude/6c729d68-f9d7-571d-9221-b0a50736d560/scratchpad/qa/test-logs; mkdir -p $OUT; rm -f $OUT/*
run(){ f=$1; n=$(basename $(dirname $f))-$(basename $f .test.mjs); s=$(date +%s); timeout 300 node --test $f > $OUT/$n.log 2>&1; rc=$?; e=$(date +%s); echo "$n rc=$rc secs=$((e-s))" >> $OUT/_summary.txt; }
export -f run; export OUT
ls tests/livon/*.test.mjs tests/ongil/*.test.mjs apps/ox-month/*.test.mjs | xargs -P 4 -I{} bash -c 'run {}'
echo DONE >> $OUT/_summary.txt

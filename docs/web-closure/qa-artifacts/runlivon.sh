#!/bin/bash
cd /tmp/claude-0/-home-claude/6c729d68-f9d7-571d-9221-b0a50736d560/scratchpad/buildcopy
OUT=/tmp/claude-0/-home-claude/6c729d68-f9d7-571d-9221-b0a50736d560/scratchpad/qa/livon-logs; mkdir -p $OUT; rm -f $OUT/*
run(){ f=$1; n=$(basename $f .test.mjs); s=$(date +%s); timeout 240 node --test $f > $OUT/$n.log 2>&1; rc=$?; e=$(date +%s); echo "$n rc=$rc secs=$((e-s))" >> $OUT/_summary.txt; }
export -f run; export OUT
ls tests/livon/*.test.mjs | xargs -P 4 -I{} bash -c 'run {}'
echo DONE >> $OUT/_summary.txt

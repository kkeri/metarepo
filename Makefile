
project_paths += src/xp01
project_paths += src/xp02

#=============================================================================

TAP = node_modules/.bin/tap -no-cov --no-coverage-report

project_names = $(notdir $(project_paths))

all: $(project_names)

ts:
	tsc -p .

ts-watch:
	tsc -w -p .

libdir:
	mkdir lib

include $(project_paths:%=%/Makefile.incl)

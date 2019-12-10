
project_paths += src/xp01
project_paths += src/xp02

#=============================================================================

TAP = node_modules/.bin/tap -no-cov --no-coverage-report

project_names = $(notdir $(project_paths))

all: $(project_names)

clean:
	rm -rf bin lib

ts:
	tsc -p .

ts-watch:
	tsc -w -p .

bindir:
	mkdir -p bin

libdir:
	mkdir -p lib

include $(project_paths:%=%/Makefile.incl)

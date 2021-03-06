
project_paths += src/xp01
project_paths += src/xp02
project_paths += src/xp03

#=============================================================================

TAP = node_modules/.bin/tap -no-cov --no-coverage-report
TSC = node_modules/.bin/tsc

project_names = $(notdir $(project_paths))

all: $(project_names)

clean:
	rm -rf bin lib

bindir:
	mkdir -p bin

libdir:
	mkdir -p lib

include $(project_paths:%=%/Makefile.incl)

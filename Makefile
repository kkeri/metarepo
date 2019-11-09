
project_paths += src/xp01
project_paths += src/xp02

#=============================================================================

project_names = $(notdir $(project_paths))

all: $(project_names)

ts:
	tsc -p .

ts-watch:
	tsc -w -p .

include $(project_paths:%=%/Makefile.incl)

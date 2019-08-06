
project_paths += src/sl
project_paths += src/minides

#=============================================================================

project_names = $(notdir $(project_paths))

all: $(project_names)

ts:
	tsc -p .

ts-watch:
	tsc -w -p .

include $(project_paths:%=%/Makefile.incl)

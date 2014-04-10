projects = content/project/*.html
groups = content/group/*.html
talks = content/talk/*.html
press = content/press_release/*.html
forcegenfiles = content/index.html \
                content/projects.atom.xml \
				content/project_hardware.html \
				content/project_software.html \
				content/project_infrastructure.html \
				content/project_groups.html \
				content/talks.html \
				content/press_release.html

build: $(forcegenfiles)
	hyde gen

# manual dependencies, touching files makes hyde regenerating it
content/index.html: $(projects) $(talks)
	touch $@
content/projects.atom.xml: $(projects)
	touch $@
content/project_hardware.html: $(projects)
	touch $@
content/project_software.html: $(projects)
	touch $@
content/project_infrastructure.html: $(projects)
	touch $@
content/project_groups.html: $(groups)
	touch $@
content/talks.html: $(talks)
	touch $@
content/press_release.html: $(press)
	touch $@

.PHONY: build

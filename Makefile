projects = content/project/*.html
groups = content/group/*.html
talks = content/talk/*.html
press = content/press_release/*.html
events = content/events/*.html
forcegenfiles = content/index.html \
                content/projects.atom.xml \
				content/project_hardware.html \
				content/project_software.html \
				content/project_infrastructure.html \
				content/project_groups.html \
				content/talks.html \
				content/press_release.html \
				content/events.html

build: $(forcegenfiles)
	hyde gen

# manual dependencies, touching files makes hyde regenerating it
content/index.html: $(projects) $(talks) $(events)
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
content/events.html: $(events)
	touch $@

upload:
	cd deploy && rsync -rluRP -e "ssh -p 2205" * root@v4.kreativitaet-trifft-technik.de:/var/www/
	ssh -p 2205 root@v4.kreativitaet-trifft-technik.de "chmod -R a+r /var/www/"

.PHONY: build upload

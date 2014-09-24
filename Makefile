projects = content/project/*.html
groups = content/group/*.html
talks = content/talk/*.html
press = content/press_release/*.html
events = content/events/*.html
series_of_events = content/series-of-events/*.html
forcegenfiles = content/index.html \
                content/projects.atom.xml \
				content/project_hardware.html \
				content/project_software.html \
				content/project_infrastructure.html \
				content/project_groups.html \
				content/talks.html \
				content/press_release.html \
				content/events.html \
				content/series_of_events.html \
				content/media/calendar-links.json

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
content/series_of_events.html: $(series_of_events)
	touch $@
content/media/calendar-links.json: $(groups) $(talks) $(events)
	touch $@
content/series-of-events/%.html: $(events)
	touch $@
content/group/%.html: $(projects)
	touch $@

upload:
	./sync.sh

clean:
	test -d && rm -rf deploy/

.PHONY: build upload

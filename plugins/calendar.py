# -*- coding: utf-8 -*-

from hyde.plugin import Plugin
from lang import default_language
from jinja2 import contextfilter
import json

calendar_links = {}

@contextfilter
def calendar_links_json():
    return json.dumps(calendar_links)

class CalendarPlugin(Plugin):
    def __init__(self, site):
        super(CalendarPlugin, self).__init__(site)

    def template_loaded(self,template):
        super(CalendarPlugin, self).template_loaded(template)
        self.template.env.globals["calendar_links"] = calendar_links_json

    def begin_site(self):
        global calendar_links
        result = {}

        for node in self.site.content.walk():
            for resource in node.resources:
                try:
                    file = resource.relative_deploy_path
                    calids = resource.meta.calendar
                except AttributeError:
                    continue
                try:
                    lang = resource.language
                except AttributeError:
                    lang = default_language

                for id in calids:
                    if result.has_key(id):
                        if result[id].has_key(lang):
                            self.logger.error("a calendar id can only be assigned to one page.")
                            self.logger.error("%s in %s will be ignored (already used by %s)" % (id, file, result[id][lang]))
                        else:
                            result[id][lang] = file
                    else:
                        result[id] = {lang: file}

        calendar_links = result

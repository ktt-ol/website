# -*- coding: utf-8 -*-

from hyde.plugin import Plugin

valid_languages = ["de", "en"]

class LangPlugin(Plugin):

    def __init__(self, site):
        super(LangPlugin, self).__init__(site)

    def begin_text_resource(self, resource, text):
        if not resource.uses_template:
            return text

        # add language variable to resource
        resource.language = resource.relative_path.split(".")[-2]
        if resource.language not in valid_languages:
            del resource.language

        return text


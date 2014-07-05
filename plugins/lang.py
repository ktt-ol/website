# -*- coding: utf-8 -*-

import os
from hyde.plugin import Plugin
from hyde.site import Resource

translatable_extensions = ["html"]
available_languages = ["de", "en"]
default_language = "de"

def get_lang(resource):
        language = resource.relative_path.split(".")[-2]
        if language not in available_languages:
            return None
        return language

def get_i18n_path(path, lang):
    reslang = path.split(".")[-2]
    if reslang not in available_languages:
        reslang = None

    if reslang == lang or reslang == None and lang == default_language:
        return None

    tmp = path.split(".")

    if tmp[-1] not in translatable_extensions:
        return None

    elif reslang == None:
        newpath = ".".join(tmp[0:-1]) + "." + lang + "." + tmp[-1]

        return newpath
    else:
        newpath = ".".join(tmp[0:-2]) + "." + lang + "." + tmp[-1]

        realpath = os.path.join("content", newpath)
        if not os.path.exists(realpath) and lang == default_language:
            newpath = ".".join(tmp[0:-2]) + "." + tmp[-1]

        return newpath

def new_i18n_resource(node, base_resource, language):
    res = Resource(base_resource.source_file, node)
    path = get_i18n_path(res.get_relative_deploy_path(), language)
    res.set_relative_deploy_path(path)

    # set some hints for further processing in later steps
    res.auto_generated_language = True
    res.content_language = get_lang(base_resource) or default_language
    res.language = language

    return res

def gen_i18n_resource(node, resource, language):
    newpath = get_i18n_path(resource.relative_path, language)

    # already correct lang or untranslatable
    if newpath == None:
        return None

    # correct lang resource exists already
    realpath = os.path.join("content", newpath)
    if os.path.exists(realpath):
        return None

    return new_i18n_resource(node, resource, language)

class LangPlugin(Plugin):

    def __init__(self, site):
        super(LangPlugin, self).__init__(site)

    def begin_site(self):

        for node in self.site.content.walk():
            added_resources = []
            for res in node.resources:
                for lang in available_languages:
                    newres = gen_i18n_resource(node, res, lang)
                    if newres is not None:
                        added_resources.append(newres)
                        self.logger.warn("auto-generated missing translation: %s [%s]" % (res.relative_path, lang))
            node.resources += added_resources

    def begin_text_resource(self, resource, text):
        if not resource.uses_template:
            return text

        if hasattr(resource, 'language'):
            return text

        # add language variable to resource
        resource.language = get_lang(resource)
        if resource.language is None:
            del resource.language

        return text


# -*- coding: utf-8 -*-
import copy
import os
import unittest
from hyde.plugin import Plugin
from hyde.site import Resource
from jinja2 import contextfilter

translatable_extensions = ["html"]
available_languages = ["de", "en"]
default_language = "de"

def i18n_filter(link, resource):
    if type(resource) is str:
        lang = resource
    else:
        lang = getattr(resource.meta, 'language', None)
    return get_i18n_path(link, lang) or link


def match_lang(res1, res2):
    # Util function (in the globals) to quick check for matching language
    return res1.meta.language == res2.meta.language


def get_lang(resource):
        language = resource.relative_path.split(".")[-2]
        if language not in available_languages:
            return None
        return language

def make_real_path(filepath):
    if filepath[0] == '/':
        filepath = filepath[1:]
    return os.path.join("content", filepath)

def get_i18n_path(path, lang):
    path_split = path.split(".")
    reslang = path_split[-2]
    if reslang not in available_languages:
        reslang = None

    if reslang == lang or reslang is None and lang == default_language:
        return None

    ext = path_split[-1]
    if ext not in translatable_extensions:
        return None

    elif reslang is None:
        newpath = "%s.%s.%s" % (".".join(path_split[0:-1]), lang, ext)

        return newpath
    else:
        newpath = "%s.%s.%s" % (".".join(path_split[0:-2]), lang, ext)

        realpath = make_real_path(newpath)
        if not os.path.exists(realpath) and lang == default_language:
            newpath = ".".join(path_split[0:-2]) + "." + ext

        return newpath

def new_i18n_resource(node, base_resource, language):
    res = Resource(base_resource.source_file, node)
    path = get_i18n_path(res.get_relative_deploy_path(), language)
    res.set_relative_deploy_path(path)

    # set some hints for further processing in later steps
    res.meta = copy.deepcopy(base_resource.meta)
    res.meta.auto_generated_language = True
    res.meta.content_language = get_lang(base_resource) or default_language
    res.meta.language = language

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

filters = {
    'i18n' : i18n_filter
}
globals = {
    'match_lang': match_lang
}

class LangPlugin(Plugin):

    def __init__(self, site):
        super(LangPlugin, self).__init__(site)

    def template_loaded(self,template):
        super(LangPlugin, self).template_loaded(template)
        self.template.env.filters.update(filters)
        self.template.env.globals.update(globals)

    def begin_site(self):
        for node in self.site.content.walk():
            added_resources = []
            for res in node.resources:
                for lang in available_languages:
                    newres = gen_i18n_resource(node, res, lang)
                    if newres is not None:
                        added_resources.append(newres)
                        self.logger.warn("auto-generated missing translation: %s [%s]" % (res.relative_path, lang))
                if not hasattr(res.meta, 'language'):
                    res.meta.language = get_lang(res)
                    if res.meta.language is None:
                        res.meta.language = default_language
            node.resources += added_resources


class TestSequenceFunctions(unittest.TestCase):

    def test_get_i18n_path(self):

        test_data = [
            # path, lang, expected result
            ("contact.de.html", "de", None),
            ("contact.de.html", "en", "contact.en.html"),
            ("contact.en.html", "de", "contact.html"),
            ("contact.en.html", "en", None),
            ("/contact.de.html", "de", None),
            ("/contact.de.html", "en", "/contact.en.html"),
            ("events.html", "de", None),
            ("events.html", "en", "events.en.html"),
            ("/events.html", "de", None),
            ("/events.html", "en", "/events.en.html")
        ]

        for test_this in test_data:
            print("testing: " + str(test_this) )
            result = get_i18n_path(test_this[0], test_this[1])
            self.assertEqual(test_this[2], result)

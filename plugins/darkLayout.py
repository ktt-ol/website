# -*- coding: utf-8 -*-
import copy
import sys
import unittest
import urlparse

from hyde.plugin import Plugin
from hyde.site import Resource


def dark_filter(link, resource, clean_before=False):
    if getattr(resource.meta, 'dark', False) is False:
        return link
    return patch_filename(link, clean_before) or link


def clean_dark_filter(link):
    link_split = link.split('.')
    new_link = filter(lambda element: element != 'dark', link_split)
    return '.'.join(new_link)

def match_dark(res1, res2):
    # Util function (in the globals) to quick check for matching dark theme
    dark1 = getattr(res1.meta, 'dark', False)
    dark2 = getattr(res2.meta, 'dark', False)
    return dark1 == dark2


def patch_filename(path, clean_before=False):
    # by this, we also support complete urls with parameter (e.g. for calendar)
    result = urlparse.urlparse(path)

    path_split = result.path.split(".")
    ext = path_split[-1]

    if ext != "html":
        return None

    if clean_before:
        # remove any 'dark' occurrences in the path
        new_split = []
        for split in path_split:
            if split != 'dark':
                new_split.append(split)
        path_split = new_split


    path_split.insert(-1, 'dark')
    new_path = ".".join(path_split)
    return urlparse.urlunparse(
            urlparse.ParseResult(result.scheme, result.netloc, new_path, result.params, result.query, result.fragment))


def new_dark_resource(node, base_resource):
    path = base_resource.get_relative_deploy_path()
    new_path = patch_filename(path)
    if new_path is None:
        return None

    res = Resource(base_resource.source_file, node)
    res.set_relative_deploy_path(new_path)

    try:
        res.meta = copy.deepcopy(base_resource.meta)
        res.meta.dark = True
    except Exception:
        print "Unexpected error:", sys.exc_info()[0]
        return None

    return res


filters = {
    'dark': dark_filter,
    'clean_dark': clean_dark_filter
}
globals = {
    'match_dark': match_dark
}


class DarkPlugin(Plugin):
    def __init__(self, site):
        super(DarkPlugin, self).__init__(site)
        self.logger.info("DarkPlugin loaded")

    def template_loaded(self, template):
        super(DarkPlugin, self).template_loaded(template)
        self.template.env.filters.update(filters)
        self.template.env.globals.update(globals)

    def begin_site(self):
        for node in self.site.content.walk():
            added_resources = []
            for res in node.resources:
                dark_res = new_dark_resource(node, res)
                if dark_res is not None:
                    added_resources.append(dark_res)

            node.resources += added_resources


class TestSequenceFunctions(unittest.TestCase):

    def test_patch_filename(self):

        test_data = [
            # path, lang, expected result
            ("contact.de.html", "contact.de.dark.html"),
            ("contact.en.html", "contact.en.dark.html"),
            ("contact.html", "contact.dark.html"),
            ("/contact.de.html", "/contact.de.dark.html"),
            ("contact.jpg", None),
            ("/calendar.html?ids=sdklfsldfjsdl", "/calendar.dark.html?ids=sdklfsldfjsdl"),
            ("http://blah.blub/calendar.html?ids=sdklfsldfjsdl", "http://blah.blub/calendar.dark.html?ids=sdklfsldfjsdl"),
            ("contact.en.dark.html", "contact.en.dark.html"),
        ]

        for test_this in test_data:
            print("testing: " + str(test_this) )
            result = patch_filename(test_this[0], True)
            self.assertEqual(test_this[1], result)

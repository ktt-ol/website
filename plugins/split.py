# -*- coding: utf-8 -*-

from hyde.plugin import Plugin
from jinja2 import contextfilter

@contextfilter
def split(ctx, string, separator):
    return string.split(separator)

filters = {
    'split' : split
}

class SplitPlugin(Plugin):

    def __init__(self, site):
        super(SplitPlugin, self).__init__(site)

    def template_loaded(self,template):
        super(SplitPlugin, self).template_loaded(template)
        self.template.env.filters.update(filters)

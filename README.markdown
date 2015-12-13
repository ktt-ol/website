# Mainframe's Website

This is the Website of Oldenburg's Hackspace AKA Mainframe.


# Building local

## Setup

You need ```hyde``` to generate the html files. We need also Python Pillow to create thumbnails.   
 
You can install both with ```pip```
```bash
sudo pip install hyde
sudo pip install Pillow
sudo pip install Image
```

On systems, where Python 3 is the default Python environment (like Arch Linux for example), you have to use ```pip2``` instead.

## Building

```
hyde gen
```

or

```
hyde gen -r
```

to generate all files. Alternatively you can use make, which calls hyde
gen, but takes care of the dependencies unknown to hyde:

```
make
```

You'll find the generated homepage in the ```deploy/``` directory. Use

```
hyde serve
```

to open a local web server for a preview ( http://localhost:8080 ).

## Jinja Documentation

 * http://jinja.pocoo.org/docs/templates/#filters
 * http://jinja.pocoo.org/docs/templates/#builtin-filters
 * http://jinja.pocoo.org/docs/dev/

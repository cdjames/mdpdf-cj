#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const meow = require('meow');
const mdpdf = require('../');

const cli = meow(
  `
    Usage:
        $ mdpdf-cj <source> [<destination>] [options]

    <source> must be a markdown file, with the extension '.md'.

    Examples:
        $ mdpdf-cj README.md
        $ mdpdf-cj README.md --style=styles.css --header=header.hbs --h-height=22mm
        $ mdpdf-cj README.md --footer=footer.hbs --f-height=22mm --debug
        $ mdpdf-cj README.md --border-left=30mm

    Options:
        --style=<filename>           A single css stylesheet you wish to apply to the PDF
        --header=<filename>          A HTML (.html) file to inject into the header of the PDF
        --h-height=<height>          The height of the header section
        --footer=<filename>          A HTML (.html) file to inject into the footer of the PDF
        --f-height=<height>          The height of the footer section
        --border=<size>              Border (top, left, bottom, right; default: 20mm)
        --border-top=<size>          Top border (default: 20mm)
        --border-left=<size>         Left border (default: 20mm)
        --border-bottom=<size>       Bottom border (default: 20mm)
        --border-right=<size>        Right border (default: 20mm)
        --gh-style                   Enable default gh-styles, when --style is used
        --no-emoji                   Disables emoji conversions
        --no-highlight               Disables syntax highlighting
        --auto-image-caption         Wrap <img> tags in <figure> and add an auto-numbered <figcaption> based on the 'alt' text; using alt text "nocaption" will exclude the image from being numbered
        --auto-toc                   Create a table of contents based on headings (h1, h2, etc); insert where <!-- toc --> is found in doc; automatically number the headings
        --auto-page-breaks           Add page breaks before each h1
        --debug                      Save the generated html for debugging
        --help                       Display this menu
        --version                    Display the application version
        --format=<format>            PDF size format: A3, A4, A5, Legal, Letter, Tabloid (Default: A4)
        --orientation=<orientation>  PDF orientation: portrait or landscape (Default: portrait)

		Length parameters (<height> and <size>) require a unit. Valid units are mm, cm, in and px.

	Global Settings:
		You can also set a global default stylesheet by setting the MDPDF_STYLES environment
		variable as the path to your single css stylesheet. The --style flag will override this.
`,
  {
    alias: {
      s: 'style',
      h: 'header',
      f: 'footer',
      d: 'debug',
      v: 'version',
      r: 'format',
      o: 'orientation',
    },
  }
);

function isMd(path) {
  if (!path) {
    return true;
  }
  const accepted = ['md'];
  const current = path.split('.').pop();
  if (accepted.indexOf(current) !== -1) {
    return true;
  }
  return false;
}

const source = cli.input[0];
if (!source || !isMd(source)) {
  // Invalid source, show help and exit
  cli.showHelp();
}

const destination =
  cli.input[1] || source.slice(0, source.indexOf('.md')) + '.pdf';
const debug = cli.flags.debug || false;
let style = cli.flags.style;
const header = cli.flags.header;
const headerHeight = cli.flags.hHeight;
const footer = cli.flags.footer;
const footerHeight = cli.flags.fHeight;
const border = cli.flags.border || '20mm';
const borderTop = cli.flags.borderTop || border;
const borderLeft = cli.flags.borderLeft || border;
const borderBottom = cli.flags.borderBottom || border;
const borderRight = cli.flags.borderRight || border;
const pdfFormat = cli.flags.format || 'A4';
const pdfOrientation = cli.flags.orientation || 'portrait';
const ghStyleFlag = cli.flags.ghStyle || false;

// Name of the environement variable
const envStyleName = 'MDPDF_STYLES';

// If styles have not been provided through the CLI flag, but the environment variable exists
if (!style && process.env[envStyleName]) {
  // Ensure the css file exists
  const envCssPath = path.resolve(process.env[envStyleName]);
  if (fs.existsSync(envCssPath)) {
    style = envCssPath;
  }
}

const options = {
  ghStyle: style ? ghStyleFlag : true,
  defaultStyle: true,
  source: path.resolve(source),
  destination: path.resolve(destination),
  styles: style ? path.resolve(style) : null,
  header: header ? path.resolve(header) : null,
  footer: footer ? path.resolve(footer) : null,
  noEmoji: cli.flags.noEmoji || false,
  noHighlight: cli.flags.noHighlight || false,
  autoImageCaption: cli.flags.autoImageCaption || false,
  autoToc: cli.flags.autoToc || false,
  autoPageBreaks: cli.flags.autoPageBreaks || false,
  debug: debug
    ? path.resolve(source.slice(0, source.indexOf('.md')) + '.html')
    : null,
  pdf: {
    format: pdfFormat,
    orientation: pdfOrientation,
    quality: '100',
    base: path.join('file://', __dirname, '/assets/'),
    header: {
      height: headerHeight || null,
    },
    footer: {
      height: footerHeight || null,
    },
    border: {
      top: borderTop,
      left: borderLeft,
      bottom: borderBottom,
      right: borderRight,
    },
  },
};

return mdpdf
  .convert(options)
  .then(pdfPath => {
    // Pretty print for terminals, or just return the output
    // path for scripts and pipes.
    if (process.stdout.isTTY) {
      console.log('✨ PDF created successfully at:', pdfPath);
    } else {
      console.log(pdfPath);
    }
  })
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  });

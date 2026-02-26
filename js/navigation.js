// navigation.js
// Centralized site navigation config for easier maintenance.

(function () {
  const NAV_LINKS = [
    { href: './about', label: 'About' },
    { href: './professor', label: 'Professor' },
    { href: './team', label: 'Members' },
    { href: './publications', label: 'Publications' },
    { href: './activity', label: 'Activity' },
    { href: './media', label: 'Media' },
    { href: './research', label: 'Research' },
  ];

  window.QMET_NAV_LINKS = NAV_LINKS;
})();

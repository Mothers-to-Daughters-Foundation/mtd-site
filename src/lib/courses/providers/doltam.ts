import type { CourseProvider } from '../types';

/** Doltam Creative Solutions (Podia). Listed by hand until an API key exists. */
export const doltamProvider: CourseProvider = {
  id: 'doltam',
  name: 'Doltam Creative Solutions',
  async listCourses() {
    return [
      {
        id: 'doltam:personal-brand',
        title: 'Create Your Personal Brand: 5 Steps to Building Authenticity',
        description:
          "A self-paced course to help you own your story, release perfection, and build a personal brand rooted in authenticity. Through 5 powerful lessons, you'll learn to recognize every experience as a steppingstone, trust that you are enough, and show up confidently as exactly who you are.",
        url: 'https://doltam.podia.com/creating-your-personal-brand-5-steps-to-building-authenticity',
        providerId: this.id,
        providerName: this.name,
        featured: true,
        length: '5 lessons · Self-paced',
      },
    ];
  },
};

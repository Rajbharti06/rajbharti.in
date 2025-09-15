const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("rajbharti.jpg");
  eleventyConfig.addPassthroughCopy("projects");
  eleventyConfig.addPassthroughCopy("blog");
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy("admin");

  // Add dynamic data from API or local JSON
  eleventyConfig.addGlobalData("blogs", async () => {
    try {
      // Try to fetch from API first (if server is running)
      try {
        const response = await fetch('http://localhost:3001/api/blog?status=published&limit=50');
        if (response.ok) {
          const data = await response.json();
          // Save to local JSON for static generation
          const blogsPath = path.join(__dirname, 'data', 'blogs.json');
          fs.writeFileSync(blogsPath, JSON.stringify(data, null, 2));
          return data;
        }
      } catch (apiError) {
        console.log('API not available, using local data');
      }

      // Fallback to local JSON
      const blogsPath = path.join(__dirname, 'data', 'blogs.json');
      if (fs.existsSync(blogsPath)) {
        const blogsData = fs.readFileSync(blogsPath, 'utf8');
        return JSON.parse(blogsData);
      }
      return [];
    } catch (error) {
      console.error('Error loading blogs data:', error);
      return [];
    }
  });

  eleventyConfig.addGlobalData("projects", async () => {
    try {
      // Try to fetch from API first (if server is running)
      try {
        const response = await fetch('http://localhost:3001/api/project?status=published&limit=50');
        if (response.ok) {
          const data = await response.json();
          // Save to local JSON for static generation
          const projectsPath = path.join(__dirname, 'data', 'projects.json');
          fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2));
          return data;
        }
      } catch (apiError) {
        console.log('API not available, using local data');
      }

      // Fallback to local JSON
      const projectsPath = path.join(__dirname, 'data', 'projects.json');
      if (fs.existsSync(projectsPath)) {
        const projectsData = fs.readFileSync(projectsPath, 'utf8');
        return JSON.parse(projectsData);
      }
      return [];
    } catch (error) {
      console.error('Error loading projects data:', error);
      return [];
    }
  });

  // Add custom filters
  eleventyConfig.addFilter("dateFormat", function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  eleventyConfig.addFilter("excerpt", function(content, length = 150) {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  });

  eleventyConfig.addFilter("slugify", function(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  });

  eleventyConfig.addFilter("filterByTag", function(items, tag) {
    if (!tag || !items) return items;
    return items.filter(item => item.tags && item.tags.includes(tag));
  });

  eleventyConfig.addFilter("filterByTechnology", function(items, tech) {
    if (!tech || !items) return items;
    return items.filter(item => item.technologies && item.technologies.includes(tech));
  });

  eleventyConfig.addFilter("search", function(items, query) {
    if (!query || !items) return items;
    const searchTerm = query.toLowerCase();
    return items.filter(item => {
      const title = item.title ? item.title.toLowerCase() : '';
      const description = item.description ? item.description.toLowerCase() : '';
      const content = item.content ? item.content.toLowerCase() : '';
      return title.includes(searchTerm) || description.includes(searchTerm) || content.includes(searchTerm);
    });
  });

  // Add collections
  eleventyConfig.addCollection("blogPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/*.md").sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  });

  eleventyConfig.addCollection("projects", function(collectionApi) {
    return collectionApi.getFilteredByGlob("projects/*.md").sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};

import {createClient} from 'https://esm.sh/@sanity/client'

const client = createClient({
  projectId: '17cyunuz',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

// HTML containers
const sidebarList = document.querySelector('#blog-category-list')  // <ul> in sidebar
const sectionsWrapper = document.querySelector('#blog-category-sections') // wrapper for all category sections

// 1) Fetch all categories
const categoryQuery = `*[_type == "category"] | order(title asc){
  title,
  "slug": slug.current
}`

client.fetch(categoryQuery).then(categories => {
  if (!categories || categories.length === 0) return

  // Build a map: category title -> section id
  const categoryMap = {}
  categories.forEach((cat, index) => {
    const title = cat.title
    const safeId = `category-${(cat.slug || title).toLowerCase().replace(/\s+/g, '-')}`
    categoryMap[title] = safeId

    // 1a) Render sidebar item
    if (sidebarList) {
      const li = document.createElement('li')
      li.className = 'mb-2'
      li.innerHTML = `
        <a href="blog.html?category=${encodeURIComponent(title)}"
           class="text-decoration-none d-flex align-items-center category-item p-3 rounded-3">
          <span class="badge rounded-circle me-3"
                style="width: 35px; height: 35px; background: #16A34A; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white;">
            ${index + 1}
          </span>
          <span class="text-dark">${title}</span>
        </a>
      `
      sidebarList.appendChild(li)
    }

    // 1b) Render empty section heading + row for posts
    if (sectionsWrapper && !document.getElementById(safeId)) {
      const section = document.createElement('section')
      section.innerHTML = `
        <h2 class="mb-4 fw-bold" style="color: var(--bs-dark);" data-category-section="${title}">
          ${title}
        </h2>
        <div id="${safeId}" class="row g-4 mb-5"></div>
      `
      sectionsWrapper.appendChild(section)
    }
  })

  const categoryTitles = Object.keys(categoryMap)

  // 2) Fetch posts using these categories
  const postsQuery = `*[_type == "post" && count(categories[@->title in $cats]) > 0] 
    | order(publishedAt desc){
      title,
      "slug": slug.current,
      "imageUrl": mainImage.asset->url,
      "authorName": author->name,
      "authorImage": author->image.asset->url,
      "categoryTitles": categories[]->title
    }`

  return client.fetch(postsQuery, {cats: categoryTitles}).then(posts => {
    // group posts by category title
    const grouped = {}
    categoryTitles.forEach(t => (grouped[t] = []))

    posts.forEach(post => {
      (post.categoryTitles || []).forEach(catTitle => {
        if (grouped[catTitle]) grouped[catTitle].push(post)
      })
    })

    // render each category section
    categoryTitles.forEach(catTitle => {
      const containerId = categoryMap[catTitle]
      const container = document.getElementById(containerId)
      if (!container) return

      const list = grouped[catTitle]
      if (!list || list.length === 0) {
        container.innerHTML = '<p class="text-muted">More insights coming soon.</p>'
        return
      }

      list.forEach(post => {
        const col = document.createElement('div')
        col.className = 'col-lg-6'

        const author = post.authorName || 'Ploxi Growth'
        const image = post.imageUrl || 'img/blog-placeholder.jpg'
        const authorImage = post.authorImage || 'img/blog-placeholder.jpg'

        col.innerHTML = `
          <div class="d-flex">
            <img
              src="${image}"
              class="me-3"
              alt="${post.title}"
              style="width: 180px; height: 180px; object-fit: cover;"
            />
            <div class="flex-grow-1">
              <h5 class="fw-bold mb-3">
                <a href="blog_template.html?slug=${encodeURIComponent(post.slug)}"
                   class="text-decoration-none text-dark">
                  ${post.title}
                </a>
              </h5>
              <div class="d-flex mb-4">
                <div class="me-2">
                  <img
                    src="${authorImage}"
                    alt="${author}"
                    class="rounded-circle"
                    style="width: 30px; height: 30px; object-fit: cover;"
                  />
                </div>
                <p class="text-muted mt-1 mb-0">
                  ${author}
                </p>
              </div>
            </div>
          </div>
        `
        container.appendChild(col)
      })
    })

   // scroll to category if ?category=... present
const params = new URLSearchParams(window.location.search)
const filterCategory = params.get('category')

if (filterCategory) {
  // wait a moment so sections are in the DOM
  setTimeout(() => {
    const anchor = document.querySelector(
      `[data-category-section="${filterCategory}"]`
    )
    if (anchor) {
      anchor.scrollIntoView({behavior: 'smooth'})
    }
  }, 1500) // 100–200ms is enough
}

  })
}).catch(err => {
  console.error(err)
})
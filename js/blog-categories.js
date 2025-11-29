// js/blog-categories.js
import {createClient} from 'https://esm.sh/@sanity/client'

const client = createClient({
  projectId: '17cyunuz',   // replace
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

// Map category titles to container ids in your HTML
const categoryMap = {
  'Clean Energy': 'clean-energy-list',
  'ESG Reports': 'esg-reports-list',
  'Water Tech': 'water-tech-list',
  'Climate Finance': 'climate-finance-list',
}

const categoryTitles = Object.keys(categoryMap)

// GROQ: fetch posts that have any of these categories
// categories[]->title dereferences the category docs
const query = `*[_type == "post" && count(categories[@->title in $cats]) > 0] 
  | order(publishedAt desc){
    title,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "authorName": author->name,
    "authorImage": author->image.asset->url,
    "categoryTitles": categories[]->title
  }`

client.fetch(query, {cats: categoryTitles}).then(posts => {
  // group posts by category title
  const grouped = {}
  categoryTitles.forEach(t => (grouped[t] = []))

  posts.forEach(post => {
    (post.categoryTitles || []).forEach(catTitle => {
      if (grouped[catTitle]) {
        grouped[catTitle].push(post)
      }
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
        <a href="blog_template.html?slug=${encodeURIComponent(post.slug)}" class="text-decoration-none text-dark">
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
    <p class="text-muted mt-1" >
      ${author}
    </p>
    </div>
    </div>
  </div>
`

      container.appendChild(col)
    })
  })
}).catch(err => {
  console.error(err)
  Object.values(categoryMap).forEach(id => {
    const el = document.getElementById(id)
    if (el && !el.innerHTML) {
      el.innerHTML = '<p class="text-muted">Unable to load blogs right now.</p>'
    }
  })
})

const params = new URLSearchParams(window.location.search)
const filterCategory = params.get('category')

// after you finish rendering all four category sections:
if (filterCategory) {
  const anchor = document.querySelector(
    `[data-category-section="${filterCategory}"]`,
  )
  if (anchor) {
    anchor.scrollIntoView({behavior: 'smooth'})
  }
}

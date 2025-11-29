import {createClient} from 'https://esm.sh/@sanity/client'

const client = createClient({
  projectId: '17cyunuz',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

const categoriesConfig = {
  'Clean Energy': {
    badgeClass: 'bg-success bg-opacity-10 text-success',
  },
  'ESG Reports': {
    badgeClass: 'bg-primary bg-opacity-10 text-primary',
  },
  'Water Tech': {
    badgeClass: 'bg-info bg-opacity-10 text-info',
  },
  'Climate Finance': {
    badgeClass: 'bg-warning bg-opacity-10 text-warning',
  },
}

const categoryTitles = Object.keys(categoriesConfig)
const container = document.getElementById('home-latest-blogs')

// If container is missing, just stop without using `return` at top level
if (!container) {
  console.warn('home-latest-blogs container not found')
} else {
  const query = `{
    ${categoryTitles
      .map(
        (cat, i) => `
      "c${i}": *[_type == "post" && count(categories[@->title == "${cat}"]) > 0]
        | order(publishedAt desc)[0]{
          title,
          "slug": slug.current,
          "imageUrl": mainImage.asset->url,
          "authorName": author->name,
          "excerpt": body[0].children[0].text,
          publishedAt,
        }
    `,
      )
      .join(',')}
  }`


  client
    .fetch(query)
    .then((result) => {
      categoryTitles.forEach((cat, index) => {
        const post = result[`c${index}`]
        if (!post) return

        const conf = categoriesConfig[cat]
        const badgeClass = conf.badgeClass
        const image = post.imageUrl || 'img/blog-placeholder.jpg'
        const author = post.authorName || 'Ploxi Growth'
        const excerpt =
          post.excerpt && post.excerpt.length > 140
            ? post.excerpt.slice(0, 140) + '...'
            : post.excerpt || ''

        const col = document.createElement('div')
        col.className = 'col-md-6'
        const date = post.publishedAt
  ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  : ''

        col.innerHTML = `
  <div class="card border-0 shadow-sm rounded-4 h-100 hover-lift">
    <div class="card-body p-4">
      <span class="badge ${badgeClass} px-3 py-2 rounded-pill mb-3">
        ${cat}
      </span>
      <h5 class="fw-bold mb-2">
        <a href="blog_template.html?slug=${encodeURIComponent(
          post.slug,
        )}" class="text-decoration-none text-dark">
          ${post.title}
        </a>
      </h5>
      <p class="text-muted small mb-2">${excerpt}</p>
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted small">${date}</span>
        <a href="blog_template.html?slug=${encodeURIComponent(
          post.slug,
        )}" class="text-success fw-semibold text-decoration-none">
          Read <i class="bi bi-arrow-right ms-1"></i>
        </a>
      </div>
    </div>
  </div>
`
        container.appendChild(col)
      })
    })
    .catch((err) => {
      console.error(err)
      container.innerHTML =
        '<p class="text-muted">Unable to load latest articles right now.</p>'
    })
}

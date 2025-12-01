import {createClient} from 'https://esm.sh/@sanity/client'

const client = createClient({
  projectId: '17cyunuz',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

const container = document.getElementById('home-latest-blogs')
if (!container) {
  console.warn('home-latest-blogs container not found')
} else {
  const query = `*[_type == "post"] | order(publishedAt desc)[0...4]{
    title,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "authorName": author->name,
    publishedAt,
    "categoryTitles": categories[]->title,
    "excerpt": body[0].children[0].text
  }`

  client.fetch(query).then(posts => {
    if (!posts || !posts.length) {
      container.innerHTML = '<p class="text-muted">No articles yet.</p>'
      return
    }

    posts.forEach((post, index) => {
      const cat = (post.categoryTitles && post.categoryTitles[0]) || 'Insights'
      const badgeClass =
        index === 0
          ? 'bg-success bg-opacity-10 text-success'
          : index === 1
          ? 'bg-primary bg-opacity-10 text-primary'
          : index === 2
          ? 'bg-info bg-opacity-10 text-info'
          : 'bg-warning bg-opacity-10 text-warning'

      const image = post.imageUrl || 'img/blog-placeholder.jpg'
      const rawExcerpt = post.excerpt || ''
      const excerpt =
        rawExcerpt.length > 140 ? rawExcerpt.slice(0, 140) + '…' : rawExcerpt
      const date = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : ''

      const col = document.createElement('div')
      col.className = 'col-md-6'
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
  }).catch(err => {
    console.error(err)
    container.innerHTML =
      '<p class="text-muted">Unable to load latest articles right now.</p>'
  })
}
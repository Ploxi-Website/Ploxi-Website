// // js/blog-detail.js
// import {createClient} from 'https://esm.sh/@sanity/client'

// const client = createClient({
//   projectId: '17cyunuz',   // replace
//   dataset: 'production',
//   apiVersion: '2025-01-01',
//   useCdn: true,
// })

// const container = document.getElementById('blog-post')
// const params = new URLSearchParams(window.location.search)
// const slug = params.get('slug')

// if (!slug) {
//   container.innerHTML = '<p>Blog not found.</p>'
// } else {
//   const query = `*[_type == "post" && slug.current == $slug][0]{
//     title,
//     "imageUrl": mainImage.asset->url,
//     "authorName": author->name,
//     "authorImage": author->image.asset->url,
//     publishedAt,
//     body
//   }`

//   client.fetch(query, {slug}).then(post => {
//     if (!post) {
//       container.innerHTML = '<p>Blog not found.</p>'
//       return
//     }

//     const author = post.authorName || 'Ploxi Growth'
//     const date = post.publishedAt
//       ? new Date(post.publishedAt).toLocaleDateString()
//       : ''

//     // very simple blockContent -> HTML (paragraphs only)
//     let bodyHtml = ''
//     if (Array.isArray(post.body)) {
//       bodyHtml = post.body
//         .filter(block => block._type === 'block')
//         .map(block => {
//           const text = (block.children || [])
//             .map(child => child.text)
//             .join('')
//           return `<p>${text}</p>`
//         })
//         .join('')
//     }
//     const authorImage = post.authorImage || 'img/author-placeholder.jpg'

//     container.innerHTML = `
//   <article class="blog-article">
//     <h1 class="mb-3">${post.title}</h1>
//     <div class="d-flex mb-4">
//      <div class="me-2">
//         <img
//           src="${authorImage}"
//           alt="${author}"
//           class="rounded-circle"
//           style="width: 30px; height: 30px; object-fit: cover;"
//         />
//       </div>
//     <p class="text-muted mt-1" >
//       ${author}${date ? ' • ' + date : ''}
//     </p>
//     </div>
//     ${post.imageUrl ? `
//       <img src="${post.imageUrl}" class="img-fluid mb-4" alt="${post.title}">
//     ` : ''}
//     <div class="blog-body fs-5">
//       ${bodyHtml}
//     </div>
//   </article>
// `

//   }).catch(err => {
//     console.error(err)
//     container.innerHTML = '<p>Unable to load this blog post.</p>'
//   })
// }

// js/blog-detail.js
import { createClient } from 'https://esm.sh/@sanity/client'

const client = createClient({
  projectId: '17cyunuz',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

const container = document.getElementById('blog-post')
const params = new URLSearchParams(window.location.search)
const slug = params.get('slug')

if (!slug) {
  container.innerHTML = '<p>Blog not found.</p>'
} else {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    "imageUrl": mainImage.asset->url,
    "authorName": author->name,
    "authorImage": author->image.asset->url,
    publishedAt,
    body
  }`

  client.fetch(query, { slug }).then(post => {
    if (!post) {
      container.innerHTML = '<p>Blog not found.</p>'
      return
    }

    const author = post.authorName || 'Ploxi Growth'
    const date = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString()
      : ''

    const authorImage = post.authorImage || 'img/author-placeholder.jpg'

    // ✅ Convert Sanity rich text to HTML (THIS IS THE KEY FIX)
    const bodyHtml = window.toHTML(post.body)

    container.innerHTML = `
      <article class="blog-article">
        <h1 class="mb-3">${post.title}</h1>

        <div class="d-flex mb-4">
          <div class="me-2">
            <img
              src="${authorImage}"
              alt="${author}"
              class="rounded-circle"
              style="width: 30px; height: 30px; object-fit: cover;"
            />
          </div>
          <p class="text-muted mt-1">
            ${author}${date ? ' • ' + date : ''}
          </p>
        </div>

        ${post.imageUrl ? `
          <img src="${post.imageUrl}" class="img-fluid mb-4" alt="${post.title}">
        ` : ''}

        <div class="blog-body fs-5">
          ${bodyHtml}
        </div>
      </article>
    `
  }).catch(err => {
    console.error(err)
    container.innerHTML = '<p>Unable to load this blog post.</p>'
  })
}

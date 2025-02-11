import { betterFetch } from './functions'

/**
 * Add an entry to the storage
 * @param {string} content Entry content
 * @param {string} description Entry body
 * @param {{ token: string, projectId: string }} auth Authentication token and project ID
 * @returns {Promise<boolean|object>} `false` if failed, otherwise the response
 */
export const addEntry = async ({ title, body, auth }) => {
  const data = await betterFetch('https://api.todoist.com/rest/v2/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': crypto.randomUUID(),
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({
      content: title,
      description: body,
      project_id: auth.projectId
    })
  }).catch((e) => {
    throw e
  })

  if (!data) {
    return false
  }

  // Connect error
  if (data.status && data.status !== 200) {
    const reason = await data.text()
    throw new Error(`${reason ? reason : 'Failed to save data to the project.'} (HTTP ${data.status})`)
  }

  return data
}

/**
 * Update an entry in the storage by ID
 * @param {string} id Entry ID
 * @param {string} content Entry content
 * @param {string} description Entry body
 * @param {{ token: string }} auth Authentication token
 * @returns {Promise<boolean|object>} `false` if failed, otherwise the response
 */
export const updateEntry = async ({ id, title, body, auth }) => {
  const data = await betterFetch(`https://api.todoist.com/rest/v2/tasks/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': crypto.randomUUID(),
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({
      content: title,
      description: body
    })
  }).catch((e) => {
    throw e
  })

  if (!data) {
    return false
  }

  // Connect error
  if (data.status && data.status !== 200) {
    const reason = await data.text()
    throw new Error(`${reason ? reason : 'Failed to update the entry.'} (HTTP ${data.status})`)
  }

  return data
}

/**
 * Delete an entry in the storage by ID
 * @param {string} id Entry ID
 * @param {{ token: string, projectId: string }} auth Authentication token
 * @returns {Promise<boolean>} `false` if failed, otherwise `true`
 */
export const deleteEntry = async({ id, auth }) => {
  const data = await betterFetch(`https://api.todoist.com/rest/v2/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${auth.token}`,
    }
  }).catch((e) => {
    throw e
  })

  if (!data) {
    return false
  }

  // Connect error
  if (data.status && data.status !== 204) {
    const reason = await data.text()
    throw new Error(`${reason ? reason : 'Failed to delete the entry.'} (HTTP ${data.status})`)
  }

  return true
}

/**
 * Get all entries from storage
 * @param {{ token: string, projectId: string }} auth Authentication token and project ID
 * @returns {Promise<boolean|object[]>} `false` if failed, otherwise the response
 */
export const getAll = async (auth) => {
  const data = await betterFetch(`https://api.todoist.com/rest/v2/tasks?project_id=${auth.projectId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth.token}`
    }
  }).catch((e) => {
    throw e
  })

  if (!data) {
    return false
  }

  // Connect error
  if (data.status && data.status !== 200) {
    const reason = await data.text()
    throw new Error(`${reason ? reason : 'Failed to read from the project.'} (HTTP ${data.status})`)
  }

  return data
}

/**
 * Delete the project from Todoist
 * @param {{ token: string, projectId: string }} auth Authentication token and project ID
 * @returns {Promise<boolean>} `false` if failed, otherwise `true`
 */
export const deleteAll = async (auth) => {
  const data = await betterFetch(`https://api.todoist.com/rest/v2/projects/${auth.projectId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${auth.token}`
    }
  }).catch((e) => {
    throw e
  })

  if (!data) {
    return false
  }

  // Connect error
  if (data.status && data.status !== 204) {
    const reason = await data.text()
    throw new Error(`${reason ? reason : 'Failed to delete the project.'} (HTTP ${data.status})`)
  }

  return true
}

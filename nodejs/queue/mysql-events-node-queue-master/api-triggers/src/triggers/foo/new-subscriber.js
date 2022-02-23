const log = require('debug')('api-triggers:foo:new-subscriber')

const Queue = require('../../libs/queue-foo') 
const NewSubscriberJob = require('../../jobs/foo/new-subscriber')

module.exports = (MySQLEvents, connection) => ({
  name: 'New Subscriber',
  expression: 'company.subscribers',
  statement: MySQLEvents.STATEMENTS.INSERT,
  onEvent: async (event) => {
    const { affectedRows } = event
    const finalObject = {
      after: {},
      before: {},
      from_database: 'FOO'
    }
    
    affectedRows.forEach((item) => {
      Object.assign(finalObject.after, item.after)
      Object.assign(finalObject.before, item.before)
    })

    await connection.query('INSERT INTO subscribers_audit SET ?', {
      subscriber_id: finalObject.after.subscriber_id,
      from_database: finalObject.from_database,
      action: 'INSERT',
      subscriber_before: JSON.stringify({ "before": finalObject.before }),
      subscriber_after: JSON.stringify({ "after": finalObject.after }),
    }, (err, results, fields) => {
      if (err) {
        log('[FOO AUDIT] [QUERY] [INSERT subscriber] - <<ERROR>> : ' + err)
      } else {
        log('[FOO AUDIT] [QUERY] [INSERT subscriber] - ((SUCCESS))')
      }
    })

    await Queue.add(NewSubscriberJob.key, {
      finalObject
    })

    log(`[TRIGGER] [FOO] [NEW SUBSCRIBER] - ((SUCCESS))`)
  }
})

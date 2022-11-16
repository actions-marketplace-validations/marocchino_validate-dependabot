import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {validateDependabot} from '../src/main'

// shows how the runner will run a javascript action with env / stdout protocol
test.skip('test runs', () => {
  process.env['INPUT_PATH'] = '.github/dependabot.yml'
  process.env['INPUT_SUCCESS_MESSAGE'] = '✅dependabot config looks good 👍'
  process.env['INPUT_FAILURE_MESSAGE'] = '🚫 dependabot errors'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
describe('validateDependabot', () => {
  test('no errors', async () => {
    expect(
      await validateDependabot(
        '.github/dependabot.yml',
        '✅dependabot config looks good 👍',
        '🚫 dependabot errors'
      )
    ).toEqual({
      message: '✅dependabot config looks good 👍'
    })
  })
  test('with errors', async () => {
    expect(
      await validateDependabot(
        '__tests__/dependabot-error.yml',
        '✅dependabot config looks good 👍',
        '🚫 dependabot errors'
      )
    ).toEqual({
      message: `
🚫 dependabot errors

| keyword | message | dataPath |
| ------- | ------- | -------- |
| required | should have required property 'directory' | .updates[0] |
`,
      errors: [
        {
          dataPath: '.updates[0]',
          keyword: 'required',
          message: "should have required property 'directory'",
          params: {
            missingProperty: 'directory'
          },
          schemaPath: '#/required'
        }
      ]
    })
  })
})

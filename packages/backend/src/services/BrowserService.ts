import { execSync } from 'child_process'

const BINARY = process.env.AGENT_BROWSER_PATH ?? 'agent-browser'

export class BrowserService {
  private session: string
  constructor(session: string) {
    this.session = session
  }

  private run(args: string): string {
    const cmd = `${BINARY} --session ${this.session} ${args}`
    return execSync(cmd, { encoding: 'utf-8', timeout: 30_000 })
  }

  open(url: string): void {
    this.run(`open ${url}`)
  }

  snapshot(flags = '-i'): string {
    return this.run(`snapshot ${flags}`)
  }

  click(sel: string): void {
    this.run(`click ${sel}`)
  }

  fill(sel: string, text: string): void {
    this.run(`fill ${sel} ${JSON.stringify(text)}`)
  }

  type(sel: string, text: string): void {
    this.run(`type ${sel} ${JSON.stringify(text)}`)
  }

  wait(sel: string): void {
    this.run(`wait ${sel}`)
  }

  screenshot(path?: string): string {
    return this.run(`screenshot ${path ?? ''}`).trim()
  }

  get url(): string {
    return this.run('get url').trim()
  }

  get title(): string {
    return this.run('get title').trim()
  }

  getText(sel: string): string {
    return this.run(`get text ${sel}`).trim()
  }

  eval(js: string): string {
    return this.run(`eval ${JSON.stringify(js)}`).trim()
  }

  batch(commands: string[]): string {
    const args = commands.map((c) => JSON.stringify(c)).join(' ')
    return this.run(`batch --json ${args}`)
  }

  close(): void {
    this.run('close')
  }
}

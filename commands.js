// Existing commands
// ...

// New command to access shell
{
  name: 'shell',
  description: 'Access the system shell',
  execute: () => {
    execFile('sh', [], { cwd: 'robtherobot' })
  }
}

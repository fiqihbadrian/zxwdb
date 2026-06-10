# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within ZxwDB, please send an email to **fiqihbadrian@example.com**. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to include in your report:

- Type of issue (e.g. SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to expect:

- A response acknowledging your report within 48 hours
- An assessment of the issue and potential impact
- A plan for fixing the vulnerability
- Credit in the security advisory (unless you prefer to remain anonymous)

## Preferred Languages

We prefer all communications to be in English or Indonesian.

## Security Best Practices for Users

When using ZxwDB, please follow these security best practices:

1. **Database Connections**: 
   - Never commit database credentials to version control
   - Use environment variables for sensitive information
   - Use SSL/TLS connections when connecting to remote databases

2. **Network Security**:
   - Only expose ZxwDB backend to trusted networks
   - Use firewall rules to restrict access
   - Consider using VPN for remote database access

3. **Updates**:
   - Keep ZxwDB updated to the latest version
   - Monitor security advisories

4. **Access Control**:
   - Use database user accounts with minimal required privileges
   - Never use root/admin accounts for everyday operations

Thank you for helping keep ZxwDB and its users safe!

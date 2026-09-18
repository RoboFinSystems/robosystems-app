#!/bin/sh
set -eu

# ============================================================================
# Next.js Runtime Environment Configuration
# ============================================================================
# This entrypoint handles runtime injection of NEXT_PUBLIC_* environment
# variables into the pre-built Next.js application.
#
# Next.js bakes NEXT_PUBLIC_* variables into the JavaScript bundle at build
# time. To create a portable Docker image that can be configured at runtime,
# we build with placeholder values and replace them when the container starts.
#
# There are two types of builds:
# 1. ECR builds (production/staging): Built with actual URLs baked in.
#    The entrypoint just starts the server.
# 2. Docker Hub builds: Built with placeholder values that get replaced
#    at runtime based on environment variables.
# ============================================================================

echo "[entrypoint] RoboSystems App - Starting..."
echo "[entrypoint] Node version: $(node --version)"

# ----------------------------------------------------------------------------
# Detect Build Type
# ----------------------------------------------------------------------------
# Check if this is a placeholder-based build by looking for placeholder
# strings in the built JavaScript files.
# ----------------------------------------------------------------------------
is_placeholder_build() {
    echo "[entrypoint] Checking build type..."
    # Check if this is a placeholder-based build by looking for placeholder
    # strings in the main chunks directory (faster than recursive grep on entire .next)
    # Use -l to list files only and -m 1 to stop after first match
    echo "[entrypoint] Scanning .next/static/chunks for placeholders..."
    if find /app/.next/static/chunks -name "*.js" -type f 2>/dev/null | head -20 | xargs grep -l -m 1 "__PLACEHOLDER_ROBOSYSTEMS_API_URL__" >/dev/null 2>&1; then
        echo "[entrypoint] Found placeholder - this is a Docker Hub build"
        return 0  # true - this is a placeholder build
    else
        echo "[entrypoint] No placeholder found - this is an ECR build"
        return 1  # false - values are baked in
    fi
}

# ----------------------------------------------------------------------------
# Environment Variable Validation (only for placeholder builds)
# ----------------------------------------------------------------------------
validate_env_vars() {
    missing_vars=""

    # Required environment variables
    if [ -z "${NEXT_PUBLIC_ROBOSYSTEMS_API_URL:-}" ]; then
        missing_vars="$missing_vars NEXT_PUBLIC_ROBOSYSTEMS_API_URL"
    fi
    if [ -z "${NEXT_PUBLIC_ROBOSYSTEMS_APP_URL:-}" ]; then
        missing_vars="$missing_vars NEXT_PUBLIC_ROBOSYSTEMS_APP_URL"
    fi
    if [ -z "${NEXT_PUBLIC_ROBOLEDGER_APP_URL:-}" ]; then
        missing_vars="$missing_vars NEXT_PUBLIC_ROBOLEDGER_APP_URL"
    fi
    if [ -z "${NEXT_PUBLIC_ROBOINVESTOR_APP_URL:-}" ]; then
        missing_vars="$missing_vars NEXT_PUBLIC_ROBOINVESTOR_APP_URL"
    fi

    if [ -n "$missing_vars" ]; then
        echo "Error: Missing required environment variables:$missing_vars"
        echo ""
        echo "This Docker image requires runtime configuration."
        echo "Please set the following environment variables:"
        echo "  NEXT_PUBLIC_ROBOSYSTEMS_API_URL   - RoboSystems API endpoint"
        echo "  NEXT_PUBLIC_ROBOSYSTEMS_APP_URL   - RoboSystems App URL"
        echo "  NEXT_PUBLIC_ROBOLEDGER_APP_URL    - RoboLedger App URL"
        echo "  NEXT_PUBLIC_ROBOINVESTOR_APP_URL  - RoboInvestor App URL"
        echo ""
        echo "Optional variables:"
        echo "  NEXT_PUBLIC_MAINTENANCE_MODE      - Enable maintenance mode (default: false)"
        echo "  NEXT_PUBLIC_TURNSTILE_SITE_KEY    - Cloudflare Turnstile site key"
        echo "  NEXT_PUBLIC_S3_ENDPOINT_URL       - S3 endpoint URL (for LocalStack)"
        echo ""
        echo "Example:"
        echo "  docker run -e NEXT_PUBLIC_ROBOSYSTEMS_API_URL=http://localhost:8000 \\"
        echo "             -e NEXT_PUBLIC_ROBOSYSTEMS_APP_URL=http://localhost:3000 \\"
        echo "             -e NEXT_PUBLIC_ROBOLEDGER_APP_URL=http://localhost:3001 \\"
        echo "             -e NEXT_PUBLIC_ROBOINVESTOR_APP_URL=http://localhost:3002 \\"
        echo "             robofinsystems/robosystems-app"
        exit 1
    fi
}

# ----------------------------------------------------------------------------
# Runtime Environment Injection
# ----------------------------------------------------------------------------
# Replace placeholder values in the built JavaScript files with actual
# environment variable values.
# ----------------------------------------------------------------------------
inject_runtime_env() {
    echo "[entrypoint] Injecting runtime environment configuration..."

    # Substitute in every file that actually contains a placeholder, rather than in a list
    # of extensions.
    #
    # The list used to be .js/.json, which missed the prerendered output: a static page bakes
    # the value into its markup (.html), its flight payload (.rsc) and its segment shell
    # (.sst), and none of those is re-rendered at runtime. The verification below greps the
    # whole of .next, so those leftovers made it fail — **the published image could not
    # start**, and the landing page's MCP address would have rendered as a literal
    # `__PLACEHOLDER_ROBOSYSTEMS_API_URL__` if it had. Extending the list one extension at a
    # time is how that happened; deriving it from the placeholder itself cannot drift, and it
    # touches nothing that has no placeholder in it.
    #
    # .next/cache is excluded from both this and the check below. It is Turbopack's build
    # cache — binary .sst blobs that are never served, that sed cannot reliably rewrite, and
    # that carry a copy of every placeholder. They are what made the check unsatisfiable.
    placeholder_files=$(grep -rl "__PLACEHOLDER_" /app/.next 2>/dev/null \
        | grep -v "^/app/.next/cache/" || true)

    # Read from a file, not a pipe: a piped `while` runs in a subshell, where `exit 1` would
    # end the loop and let startup carry on.
    if [ -n "$placeholder_files" ]; then
        echo "$placeholder_files" > /tmp/placeholder-files.txt
        while IFS= read -r file; do
            [ -n "$file" ] || continue
            if ! sed -i \
                -e "s|__PLACEHOLDER_ROBOSYSTEMS_API_URL__|${NEXT_PUBLIC_ROBOSYSTEMS_API_URL}|g" \
                -e "s|__PLACEHOLDER_ROBOSYSTEMS_APP_URL__|${NEXT_PUBLIC_ROBOSYSTEMS_APP_URL}|g" \
                -e "s|__PLACEHOLDER_ROBOLEDGER_APP_URL__|${NEXT_PUBLIC_ROBOLEDGER_APP_URL}|g" \
                -e "s|__PLACEHOLDER_ROBOINVESTOR_APP_URL__|${NEXT_PUBLIC_ROBOINVESTOR_APP_URL}|g" \
                -e "s|__PLACEHOLDER_MAINTENANCE_MODE__|${NEXT_PUBLIC_MAINTENANCE_MODE:-false}|g" \
                -e "s|__PLACEHOLDER_TURNSTILE_SITE_KEY__|${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-}|g" \
                -e "s|__PLACEHOLDER_CF_ANALYTICS_TOKEN__|${NEXT_PUBLIC_CF_ANALYTICS_TOKEN:-}|g" \
                -e "s|__PLACEHOLDER_S3_ENDPOINT_URL__|${NEXT_PUBLIC_S3_ENDPOINT_URL:-}|g" \
                "$file"; then
                echo "[entrypoint] Error: Failed to inject runtime configuration into $file"
                exit 1
            fi
        done < /tmp/placeholder-files.txt
        rm -f /tmp/placeholder-files.txt
    fi

    # Verify nothing that gets served still carries the placeholder.
    remaining=$(grep -rl "__PLACEHOLDER_ROBOSYSTEMS_API_URL__" /app/.next 2>/dev/null \
        | grep -v "^/app/.next/cache/" || true)
    if [ -n "$remaining" ]; then
        echo "[entrypoint] Error: Placeholder replacement failed - API URL placeholder still present in:"
        echo "$remaining" | head -5
        exit 1
    fi

    echo "[entrypoint] Runtime environment configuration complete."
}

# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
echo "[entrypoint] Checking .next directory..."
echo "[entrypoint] .next size: $(du -sh /app/.next 2>/dev/null | cut -f1 || echo 'unknown')"
echo "[entrypoint] .next/static/chunks file count: $(find /app/.next/static/chunks -name "*.js" -type f 2>/dev/null | wc -l || echo 'unknown')"

if is_placeholder_build; then
    echo "[entrypoint] Detected placeholder-based build (Docker Hub image)"
    validate_env_vars
    inject_runtime_env
else
    echo "[entrypoint] Detected pre-configured build (ECR image)"
    echo "[entrypoint] Environment values are baked into the build."
fi

echo "[entrypoint] Starting Next.js server on port ${PORT:-3000}..."
# Exec next directly: the runtime image has no npm CLI (see Dockerfile), and
# this hands SIGTERM straight to the server instead of relying on npm to
# forward it.
exec /app/node_modules/.bin/next start

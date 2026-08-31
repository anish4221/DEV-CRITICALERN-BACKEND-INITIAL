pipeline {
  agent any

  environment {
    IMAGE_NAME = "criticalerb_backend_blog"
    VERSION = "${BUILD_NUMBER}"
    CONTAINER_NAME = "criticalerb_backend_blog"
    PORT = "3300"
    DOCKER = "sudo docker"

    GIT_CREDENTIALS_ID = "criticalernblogbackend"
    GIT_BRANCH = "main"
    GIT_REPO_URL = "https://github.com/Criticalern-Pvt-Ltd/Criticalern_backend.git"
    ENV_FILE_CREDENTIALS_ID = "criticalernblogbackendenv"
  }

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  stages {

    stage('Clone Code') {
      steps {
        git branch: "${GIT_BRANCH}",
            credentialsId: "${GIT_CREDENTIALS_ID}",
            url: "${GIT_REPO_URL}"
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
        set -e
        echo "🔨 Building image ${IMAGE_NAME}:${VERSION}"

        $DOCKER build \
          --build-arg NODE_ENV=production \
          -t ${IMAGE_NAME}:${VERSION} \
          -t ${IMAGE_NAME}:latest .
        '''
      }
    }

    stage('Deploy Container') {
      steps {
        withCredentials([file(credentialsId: "${ENV_FILE_CREDENTIALS_ID}", variable: 'ENVFILE')]) {
          sh '''
          set -e

          SECURE_DIR=$(mktemp -d)
          chmod 700 $SECURE_DIR
          cat $ENVFILE > $SECURE_DIR/.env
          chmod 400 $SECURE_DIR/.env

          echo "🛑 Stopping old container..."
          $DOCKER stop ${CONTAINER_NAME} || true
          $DOCKER rm ${CONTAINER_NAME} || true

          echo "🚀 Starting container on port ${PORT}..."
          $DOCKER run -d \
          --name ${CONTAINER_NAME} \
          --env-file $SECURE_DIR/.env \
          --read-only \
          --cap-drop ALL \
          --cap-add CHOWN \
          --cap-add NET_BIND_SERVICE \
          --security-opt no-new-privileges:true \
          --tmpfs /tmp:rw,noexec,nosuid,size=100m \
          --tmpfs /var/tmp:rw,noexec,nosuid,size=100m \
          --tmpfs /app/logs:rw,nosuid,size=50m \
          --tmpfs /app/uploads:rw,nosuid,size=200m \
          --memory="1024m" \
          --cpus="2.0" \
          --pids-limit 200 \
          --ulimit nofile=1024:2048 \
          -p ${PORT}:${PORT} \
          --restart unless-stopped \
          --log-driver json-file \
          --log-opt max-size=10m \
          --log-opt max-file=3 \
          ${IMAGE_NAME}:${VERSION}

          chmod 600 $SECURE_DIR/.env
          shred -u -z -n 3 $SECURE_DIR/.env 2>/dev/null || rm -f $SECURE_DIR/.env
          rmdir $SECURE_DIR || true

          echo "✅ Container deployed on port ${PORT}"
          '''
        }
      }
    }
    stage('Health Check') {
      steps {
        sh '''
        echo "🔍 Checking container health..."
        sleep 5

        echo "=== Container Status ==="
        $DOCKER ps | grep ${CONTAINER_NAME}
        
        echo "\n=== Container Logs ==="
        $DOCKER logs ${CONTAINER_NAME} --tail=20

        echo "\n=== Testing Health Endpoint ==="
        for i in $(seq 1 10); do
          if curl -f http://localhost:${PORT}/health >/dev/null 2>&1; then
            echo "✅ Health check passed on port ${PORT}"
            exit 0
          fi
          echo "Waiting... ($i/10)"
          sleep 3
        done

        echo "❌ Health check failed - showing full logs:"
        $DOCKER logs ${CONTAINER_NAME}
        exit 1
        '''
      }
    }

    stage('Cleanup Old Images') {
      steps {
        sh '''
        echo "🧹 Cleaning old images..."

        $DOCKER images ${IMAGE_NAME} --format "{{.Tag}}" | \
        grep -E "^[0-9]+$" | \
        sort -rn | \
        tail -n +4 | \
        xargs -r -I {} $DOCKER rmi ${IMAGE_NAME}:{} || true

        $DOCKER image prune -f || true
        '''
      }
    }

  }

  post {

    success {
      echo "✅ Deployment successful! Container ${CONTAINER_NAME} running on port ${PORT}"
    }

    failure {
      echo "❌ Deployment failed!"
      sh '''
      $DOCKER logs ${CONTAINER_NAME} || true
      '''
    }

    always {
      sh '''
      $DOCKER image prune -f --filter "dangling=true" || true
      '''
    }
  }
}
CONTAINER_NAME

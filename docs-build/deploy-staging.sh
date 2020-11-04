#!/bin/bash

echo PATH_PREFIX=$PATH_PREFIX > .env.staging
echo ALGOLIA_API_KEY=$ALGOLIA_API_KEY >> .env.staging
echo ALGOLIA_INDEX_NAME=$ALGOLIA_INDEX_NAME >> .env.staging

/bin/bash ./build.sh \
&& aws s3 sync public/ s3://cubejs-docs-staging/docs \
&& echo "Deployed staging at: http://cubejs-docs-staging.s3-website-us-east-1.amazonaws.com/docs/"

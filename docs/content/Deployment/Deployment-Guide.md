---
title: Deployment Guide
permalink: /deployment/guide
category: Deployment
menuOrder: 2
redirect_from:
  - /deployment/
---

This section contains guides, best practices and advices related to deploying
and managing Cube.js in production.

If you are moving Cube.js to production, check this guide:

[Production Checklist][ref-deploy-prod-list]

&nbsp;

Below you can find guides for popular deployment environments:

- [Docker][ref-deploy-docker]
- [AWS Serverless][ref-deploy-sls-aws]
- [GCP Serverless][ref-deploy-sls-gcp]
- [Cube Cloud](#cube-cloud)

## Cube Cloud

<!-- prettier-ignore-start -->
[[info | ]]
| [Cube Cloud][link-cube-cloud] currently is in early access. If you don't have
| an account yet, you can [sign up to the waitlist here][link-cube-cloud].
<!-- prettier-ignore-end -->

Cube Cloud is a purpose-built platform to run Cube.js applications in
production. It is made by the creators of Cube.js and incorporates all the best
practices of running and scaling Cube.js applications.

![Cube Cloud Architecture Diagram](https://raw.githubusercontent.com/cube-js/cube.js/master/docs/content/Deployment/how-cube-cloud-works.png)

Cube Cloud can be integrated with your GitHub to automatically deploy from the
specified production branch (`master` by default). It can also create staging
and preview APIs based on the branches in the repository.

You can learn more about [deployment with Cube Cloud][ref-cloud-deploy] in its
documentation.

[link-cube-cloud]: https://cube.dev/cloud
[ref-cloud-deploy]: /cloud/deploys
[ref-deploy-docker]: /deployment/platforms/docker
[ref-deploy-prod-list]: /deployment/production-checklist
[ref-deploy-sls-aws]: /deployment/platforms/serverless/aws
[ref-deploy-sls-gcp]: /deployment/platforms/serverless/gcp

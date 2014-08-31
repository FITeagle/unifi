UNIFI
=====

Delivery Mechanism: UNIFI

-------------------

Requirements: 
  - The module 'api'
  - The modules'core/usermanagement', 'core/config', 'core/aaa' and 'native' must be deployed

  - If all projects are cloned, execute:
cd api/; git pull; mvn clean install; cd -; cd core/ git pull; mvn clean install wildfly:deploy; cd -; cd native/; git pull; mvn clean wildfly:deploy; cd -;

  - Afterwards the UNIFI-GUI should be visible under https://localhost:8443/unifi/
  - Initially there will be a user who is a FEDERATION_ADMIN and can be used with the credentials: username:admin, password:admin







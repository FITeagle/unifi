UNIFI
=====

Delivery Mechanism: UNIFI

-------------------

Requirements: 
  - The modules'core/usermanagement' and 'native' must be deployed

  - If all projects are cloned, execute:
 cd core/usermanagement git pull; mvn clean install wildfly:deploy; cd -; cd native/; git pull; mvn clean wildfly:deploy; cd -;

  - Afterwards the UNIFI-GUI should be visible under https://localhost:8443/unifi/
  - Initially there will be a user who is a FEDERATION_ADMIN and can be used with the credentials: username:admin, password:admin

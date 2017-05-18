<?php

namespace Drupal\casost\Controller;

use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\user\Entity\User;
use Drupal\Core\Database\Connection;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use phpCAS;

class CASLogout extends ControllerBase
{
    protected $serverVersion;
    protected $serverHostname;
    protected $serverPort;
    protected $serverUri;
    protected $changeSessionId;
    protected $CASServerCACert;
    protected $CASServerCNValidate;
    protected $noCASServerValidation;
    protected $proxy;
    protected $handleLogoutRequests;
    protected $CASLang;
    protected $allowed1;
    protected $allowed1Value;
    protected $allowed2;
    protected $allowed2Value;

    protected $entity_query;
    protected $entityTypeManager;
    protected $logger;
    protected $connection;

    public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    QueryFactory $entity_query,
    Connection $connection,
    LoggerChannelFactoryInterface $loggerChannel)
    {
        $this->entityTypeManager = $entityTypeManager;
        $this->entity_query = $entity_query;
        $this->connection = $connection;
        $this->logger = $loggerChannel->get('casost');
    }

    public static function create(ContainerInterface $container)
    {
        return new static(
          $container->get('entity.manager'),
          $container->get('entity.query'),
          $container->get('database'),
          $container->get('logger.factory')
      );
    }

    public function logoutGo(Request $request)
    {
        $configRowName = 'casost_sch_sso_config';
        try {

            $configRowId = $request->query->get('config');
            if ($configRowId) {
                $configRowName = $configRowName.'_'.$configRowId;
            }
            $CASOSTConfigs = $this->entityTypeManager->getStorage('casost_config')->loadByProperties(array('name' => $configRowName));
            $CASOSTConfig = reset($CASOSTConfigs);
            if ($CASOSTConfig) {
                $this->serverVersion = $CASOSTConfig->serverversion->value;
                $this->serverHostname = $CASOSTConfig->serverhostname->value;
                $this->serverPort = $CASOSTConfig->serverport->value;
                $this->serverUri = $CASOSTConfig->serveruri->value === null ? '' : $CASOSTConfig->serveruri->value;
                $this->redirectUrl = $CASOSTConfig->redirecturl->value;
                $this->changeSessionId = $CASOSTConfig->changesessionid->value;
                $this->CASServerCACert = $CASOSTConfig->casservercacert->value;
                $this->CASServerCNValidate = $CASOSTConfig->casservercnvalidate->value;
                $this->noCASServerValidation = $CASOSTConfig->nocasservervalidation->value;
                $this->proxy = $CASOSTConfig->proxy->value;
                $this->handleLogoutRequests = $CASOSTConfig->handlelogoutrequests->value;
                $this->CASLang = $CASOSTConfig->caslang->value;
                $this->allowed1 = $CASOSTConfig->allowed1->value;
                $this->allowed1Value = $CASOSTConfig->allowed1value->value;
                $this->allowed2 = $CASOSTConfig->allowed2->value;
                $this->allowed2Value = $CASOSTConfig->allowed2value->value;
            } else {
                return $this->redirectForbidden($configRowName, '7001');
            }

            // Enable debugging
            phpCAS::setDebug("phpcas.log");
            // Enable verbose error messages. Disable in production!
            phpCAS::setVerbose(true);

            // Initialize phpCAS
            phpCAS::client($this->serverVersion,
                $this->serverHostname,
                intval($this->serverPort),
                $this->serverUri,
                boolval($this->changeSessionId));

            $authToken = $request->headers->get('PHP_AUTH_USER');
            $users = $this->entityTypeManager->getStorage('user')->loadByProperties(array('name' => $authToken));
            $user = reset($users);

            if (!$user) {
                return $this->redirectForbidden($configRowName, '7002');
            }
//            phpCAS::handleLogoutRequests();

//            phpCAS::logoutWithRedirectService('http://eduslim2.minedu.gov.gr/dist/#/school');
//            session_unset();
//            session_destroy();
            $user->setPassword(uniqid('pw'));
            $user->save();




            $response = new Response();
            $response->setContent('logout successful');
            $response->setStatusCode(Response::HTTP_OK);
            $response->headers->set('Content-Type', 'application/json');

        //    phpCAS::logout(array('url'=>$this->redirectUrl));
        //    phpCAS::logout();
        session_unset();
        session_destroy();
            \Drupal::service('page_cache_kill_switch')->trigger();
//            phpCAS::logoutWithRedirectServiceAndUrl('https://sso-test.sch.gr/logout','');
//            header('Location: '.'https://sso-test.sch.gr/login?service=https%3A%2F%2Feduslim2.minedu.gov.gr%2Fdrupal%2Fcas%2Flogin%3Fconfig%3D2');
//            header('Location: https://sso-test.sch.gr/logout');
    //        exit(0);
    //        return new RedirectResponseWithCookieExt("https://sso-test.sch.gr/logout", 302, []);
            return $response;
        } catch (\Exception $e) {
            $this->logger->warning($e->getMessage());
            return $this->redirectForbidden($configRowName, '8000');
        }
    }

    private function redirectForbidden($configRowName, $errorCode) {
        session_unset();
        session_destroy();
        \Drupal::service('page_cache_kill_switch')->trigger();
        if ('casost_sch_sso_config' === $configRowName) {
            return new RedirectResponse($this->redirectUrl.'&error_code=' . $errorCode, 302, []);
        } else {
            return new RedirectResponseWithCookieExt($this->redirectUrl .'&error_code=' . $errorCode, 302, []);
        }
    }
}
import React, { useCallback, useState } from 'react';
import { Box, Flex, Button, useDisclosure, Image } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { serviceSideProps } from '@/web/common/utils/i18n';
import PageContainer from '@/components/PageContainer';
import CreateModal from './component/CreateModal';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useI18n } from '@/web/context/I18n';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import List from './component/List';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { FolderIcon } from '@fastgpt/global/common/file/image/constants';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { postCreateAppFolder } from '@/web/core/app/api/app';
import type { EditFolderFormType } from '@fastgpt/web/components/common/MyModal/EditFolderModal';
import { useContextSelector } from 'use-context-selector';
import AppListContextProvider, { AppListContext } from './component/context';
import FolderPath from '@/components/common/folder/Path';
import { useRouter } from 'next/router';
import FolderSlideCard from '@/components/common/folder/SlideCard';
import { delAppById } from '@/web/core/app/api';
import {
  AppDefaultPermissionVal,
  AppPermissionList
} from '@fastgpt/global/support/permission/app/constant';
import {
  deleteAppCollaborators,
  getCollaboratorList,
  postUpdateAppCollaborators
} from '@/web/core/app/api/collaborator';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const EditFolderModal = dynamic(
  () => import('@fastgpt/web/components/common/MyModal/EditFolderModal')
);

const MyApps = () => {
  const { t } = useTranslation();
  const { appT } = useI18n();
  const router = useRouter();
  const { isPc } = useSystemStore();
  const {
    paths,
    parentId,
    myApps,
    loadMyApps,
    onUpdateApp,
    setMoveAppId,
    isFetchingApps,
    folderDetail
  } = useContextSelector(AppListContext, (v) => v);
  const { userInfo } = useUserStore();

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();
  const [editFolder, setEditFolder] = useState<EditFolderFormType>();

  const { runAsync: onCreateFolder } = useRequest2(postCreateAppFolder, {
    onSuccess() {
      loadMyApps();
    },
    errorToast: 'Error'
  });
  const { runAsync: onDeleFolder } = useRequest2(delAppById, {
    onSuccess() {
      router.replace({
        query: {
          parentId: folderDetail?.parentId
        }
      });
    },
    errorToast: 'Error'
  });

  return (
    <PageContainer
      isLoading={myApps.length === 0 && isFetchingApps}
      insertProps={{ px: folderDetail ? [4, 6] : [4, 10] }}
    >
      <Flex gap={5}>
        <Box flex={'1 0 0'}>
          <Flex pt={[4, 6]} pb={'40px'} alignItems={'center'} justifyContent={'space-between'}>
            <FolderPath
              paths={paths}
              FirstPathDom={
                <Flex flex={1} justifyContent={'space-between'} alignItems={'center'}>
                  <Flex flexFlow={'column'}>
                    <Box letterSpacing={1} fontSize={'40px'} color={'rgba(2, 189, 170, 1)'} fontWeight={'bold'}>
                      {appT('My Apps')}
                    </Box>
                    <Box letterSpacing={1} fontSize={'36px'} fontWeight={'bold'}>
                      {appT('My Apps Intro')}
                    </Box>
                  </Flex>
                  <Image src={'/imgs/workflow/db.png'} alt={''} mr={'64px'} h={'176px'} w={'196px'} />
                </Flex>
              }
              onClick={(parentId) => {
                router.push({
                  query: {
                    parentId
                  }
                });
              }}
            />

            {userInfo?.team?.permission?.hasWritePer && (
              <MyMenu
                width={150}
                iconSize="1.5rem"
                Button={
                  <Button leftIcon={<AddIcon />} variant={'primaryOutline'} onClick={onOpenCreateModal} width={'88px'} height={'32px'} background={'linear-gradient(131.62deg, rgba(0, 196, 177, 1) 0%, rgba(67, 232, 213, 1) 100%)'} color={'#fff'} _hover={{
                    background: 'linear-gradient(131.62deg, rgba(0, 196, 177, 1) 0%, rgba(67, 232, 213, 1) 100%)'
                  }}>
                    <Box>{t('common.Create New')}</Box>
                  </Button>
                }
                menuList={[
                  {
                    children: [
                      {
                        icon: 'core/app/simpleBot',
                        label: appT('Create bot'),
                        description: appT('Create one ai app'),
                        onClick: onOpenCreateModal
                      }
                    ]
                  },
                  {
                    children: [
                      {
                        icon: FolderIcon,
                        label: t('Folder'),
                        onClick: () => setEditFolder({})
                      }
                    ]
                  }
                ]}
              />
            )}
          </Flex>

          <List />
        </Box>
        {!!folderDetail && isPc && (
          <Box pt={[4, 6]}>
            <FolderSlideCard
              refreshDeps={[folderDetail._id]}
              name={folderDetail.name}
              intro={folderDetail.intro}
              onEdit={() => {
                setEditFolder({
                  id: folderDetail._id,
                  name: folderDetail.name,
                  intro: folderDetail.intro
                });
              }}
              onMove={() => setMoveAppId(folderDetail._id)}
              deleteTip={appT('Confirm delete folder tip')}
              onDelete={() => onDeleFolder(folderDetail._id)}
              defaultPer={{
                value: folderDetail.defaultPermission,
                defaultValue: AppDefaultPermissionVal,
                onChange: (e) => {
                  return onUpdateApp(folderDetail._id, { defaultPermission: e });
                }
              }}
              managePer={{
                permission: folderDetail.permission,
                onGetCollaboratorList: () => getCollaboratorList(folderDetail._id),
                permissionList: AppPermissionList,
                onUpdateCollaborators: ({
                  tmbIds,
                  permission
                }: {
                  tmbIds: string[];
                  permission: number;
                }) => {
                  return postUpdateAppCollaborators({
                    tmbIds,
                    permission,
                    appId: folderDetail._id
                  });
                },
                onDelOneCollaborator: (tmbId: string) =>
                  deleteAppCollaborators({
                    appId: folderDetail._id,
                    tmbId
                  })
              }}
            />
          </Box>
        )}
      </Flex>

      {!!editFolder && (
        <EditFolderModal
          {...editFolder}
          onClose={() => setEditFolder(undefined)}
          onCreate={(data) => onCreateFolder({ ...data, parentId })}
          onEdit={({ id, ...data }) => onUpdateApp(id, data)}
        />
      )}
      {isOpenCreateModal && <CreateModal onClose={onCloseCreateModal} />}
    </PageContainer>
  );
};

function ContextRender() {
  return (
    <AppListContextProvider>
      <MyApps />
    </AppListContextProvider>
  );
}

export default ContextRender;

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['app']))
    }
  };
}

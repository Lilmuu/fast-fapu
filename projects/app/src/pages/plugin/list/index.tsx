import React, { useState } from 'react';
import { Box, Grid, useTheme, Flex, IconButton, Button, Image } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { AddIcon } from '@chakra-ui/icons';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useTranslation } from 'next-i18next';

import MyIcon from '@fastgpt/web/components/common/Icon';
import PageContainer from '@/components/PageContainer';
import Avatar from '@/components/Avatar';
import EditModal, { defaultForm } from './component/EditModal';
import { getPluginPaths, getUserPlugins } from '@/web/core/plugin/api';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import { useUserStore } from '@/web/support/user/useUserStore';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { defaultHttpPlugin } from './component/HttpPluginEditModal';
import { PluginTypeEnum } from '@fastgpt/global/core/plugin/constants';
import ParentPaths from '@/components/common/ParentPaths';
import { EditFormType } from './component/type';
import dynamic from 'next/dynamic';

const HttpPluginEditModal = dynamic(() => import('./component/HttpPluginEditModal'));

const TeamPlugins = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserStore();
  const router = useRouter();
  const { parentId } = router.query as { parentId: string };
  const [editModalData, setEditModalData] = useState<EditFormType>();
  const [httpPluginEditModalData, setHttpPluginModalData] = useState<EditFormType>();

  /* load plugins */
  const {
    data = [],
    isLoading,
    refetch
  } = useQuery(
    ['loadModules', parentId],
    () => {
      return Promise.all([
        getUserPlugins({ parentId: parentId === undefined ? '' : parentId }),
        getPluginPaths(parentId)
      ]);
    },
    {
      refetchOnMount: true
    }
  );

  const paths = data?.[1] || [];
  const plugins = data?.[0] || [];

  return (
    <PageContainer isLoading={isLoading} insertProps={{ px: [5, '32px'] }}>
      <Flex pt={[4, '44px']} pb={'40px'} alignItems={'center'} justifyContent={'space-between'}>
        <ParentPaths
          paths={paths.map((path, i) => ({
            parentId: path.parentId,
            parentName: path.parentName
          }))}
          FirstPathDom={
            <Flex flex={1} alignItems={'center'} display={'flex'} justifyContent={'space-between'}>
              <Box color={'rgba(2, 189, 170, 1)'} letterSpacing={1} fontSize={'40px'} fontWeight={'bold'}>
                {t('plugin.My Plugins')}({t('common.Beta')})
              </Box>
              <Image src={'/imgs/workflow/db.png'} alt={''} mr={'64px'} h={'176px'} w={'196px'} />
            </Flex>
          }
          onClick={(e) => {
            router.push({
              query: {
                parentId: e
              }
            });
          }}
        />
        {userInfo?.team?.permission?.hasWritePer && (
          <MyMenu
            offset={[-30, 5]}
            width={120}
            Button={
              <Button variant={'primaryOutline'} px={0} width={'88px'} height={'32px'} background={'linear-gradient(131.62deg, rgba(0, 196, 177, 1) 0%, rgba(67, 232, 213, 1) 100%)'} color={'#fff'} _hover={{
                background: 'linear-gradient(131.62deg, rgba(0, 196, 177, 1) 0%, rgba(67, 232, 213, 1) 100%)'
              }}>
                <Flex alignItems={'center'} px={'20px'}>
                  <AddIcon mr={2} />
                  <Box>{t('common.Create New')}</Box>
                </Flex>
              </Button>
            }
            menuList={[
              {
                children: [
                  {
                    label: (
                      <Flex>
                        <Image src={'/imgs/workflow/plugin.svg'} alt={''} w={'18px'} mr={1} />
                        {t('plugin.Custom Plugin')}
                      </Flex>
                    ),
                    onClick: () => setEditModalData(defaultForm)
                  },
                  {
                    label: (
                      <Flex display={'flex'} alignItems={'center'}>
                        <Image
                          src={'/imgs/workflow/http.png'}
                          alt={''}
                          w={'18px'}
                          h={'14px'}
                          mr={1}
                        />
                        {t('plugin.HTTP Plugin')}
                      </Flex>
                    ),
                    onClick: () => setHttpPluginModalData(defaultHttpPlugin)
                  }
                ]
              }
            ]}
          />
        )}
      </Flex>
      <Grid
        py={5}
        gridTemplateColumns={['1fr', 'repeat(2,1fr)', 'repeat(3,1fr)', 'repeat(4,1fr)']}
        gridGap={5}
      >
        {plugins.map((plugin) => (
          <Box
            key={plugin._id}
            py={3}
            px={5}
            cursor={'pointer'}
            minH={'140px'}
            borderWidth={'1.5px'}
            borderColor={'borderColor.low'}
            bg={'white'}
            borderRadius={'md'}
            userSelect={'none'}
            position={'relative'}
            _hover={{
              borderColor: 'rgba(68, 194, 181, 1)',
              boxShadow: '1.5',
              '& .edit': {
                display: 'flex'
              }
            }}
            onClick={() => {
              if (plugin.type === PluginTypeEnum.folder) {
                router.push({
                  query: {
                    parentId: plugin._id
                  }
                });
              } else {
                router.push({
                  pathname: '/plugin/edit',
                  query: {
                    pluginId: plugin._id
                  }
                });
              }
            }}
          >
            <Flex alignItems={'center'} h={'38px'}>
              <Avatar src={plugin.avatar} borderRadius={'md'} w={'28px'} />
              <Box ml={3}>{plugin.name}</Box>
              <IconButton
                className="edit"
                position={'absolute'}
                top={4}
                right={4}
                size={'smSquare'}
                icon={<MyIcon name={'edit'} w={'14px'} />}
                variant={'whitePrimary'}
                aria-label={'edit'}
                display={['', 'none']}
                _hover={{
                  bg: 'primary.100'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const data = {
                    id: plugin._id,
                    parentId: plugin.parentId,
                    name: plugin.name,
                    avatar: plugin.avatar,
                    intro: plugin.intro,
                    modules: [],
                    type: plugin.type,
                    metadata: plugin.metadata
                  };
                  if (plugin.type === PluginTypeEnum.folder) {
                    return setHttpPluginModalData(data);
                  }
                  setEditModalData(data);
                }}
              />
            </Flex>
            <Box
              className={'textEllipsis3'}
              py={2}
              wordBreak={'break-all'}
              fontSize={'sm'}
              color={'myGray.600'}
            >
              {plugin.intro || t('plugin.No Intro')}
            </Box>
          </Box>
        ))}
      </Grid>
      {data.length === 0 && <EmptyTip />}
      {!!editModalData && (
        <EditModal
          defaultValue={editModalData}
          onClose={() => setEditModalData(undefined)}
          onSuccess={refetch}
          onDelete={refetch}
        />
      )}
      {!!httpPluginEditModalData && (
        <HttpPluginEditModal
          defaultPlugin={httpPluginEditModalData}
          onClose={() => setHttpPluginModalData(undefined)}
          onSuccess={refetch}
          onDelete={refetch}
        />
      )}
    </PageContainer>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default TeamPlugins;
